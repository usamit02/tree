import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { MysqlService } from '../service/mysql.service';
import { TREE_ACTIONS, KEYS, ITreeOptions, TreeNode, TreeModel, TreeDropDirective } from 'angular-tree-component';
import * as _ from 'lodash';
import { Room } from '../class';
@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {
  @Output() selected = new EventEmitter<Room>();
  @ViewChild('tree') tree;
  user = { uid: "AMavP9Icrfe7GbbMt0YCXWFWIY42" };
  rooms = [];
  nodes = [];
  room: string;
  options: ITreeOptions = {
    displayField: 'na',
    isExpandedField: 'expanded',
    idField: 'id',
    hasChildrenField: 'nodes',
    actionMapping: {
      mouse: {
        dblClick: (tree: TreeModel, node: TreeNode, e: MouseEvent) => {
          if (node.hasChildren) TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, e);
        },
        contextMenu: (tree: TreeModel, node: TreeNode, e: MouseEvent) => {
          e.preventDefault();
          if (this.contextMenu && node === this.contextMenu.node) {
            return this.closeMenu();
          }
          this.contextMenu = {
            node: node,
            x: e.pageX,
            y: e.pageY
          };

        },
        click: (tree: TreeModel, node: TreeNode, e: MouseEvent) => {
          this.closeMenu();
          this.selected.emit(node.data);
          TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, e);
        },
        drop: (tree: TreeModel, node: TreeNode, e: MouseEvent, { from, to }) => {
          if (node.parent) {
            tree.moveNode(from, { parent: node, index: to.index });
            this.change = true;
          } else {
            alert("権限がありません。");
          }
        }

      },
      keys: {
        [KEYS.ENTER]: (tree, node, $event) => {
          node.expandAll();
        }
      }
    },
    nodeHeight: 23,
    allowDrag: (node) => {
      return true;
    },
    allowDrop: (node) => {
      return true;
    }
  }
  contextMenu: { node: TreeNode, x: number, y: number } = null;
  sourceNode: TreeNode = null;
  editNode: TreeNode = null;
  doCut = false;
  change = false;
  closeMenu = () => {
    this.contextMenu = null;
  }
  copy = () => {
    this.sourceNode = this.contextMenu.node;
    this.doCut = false;
    this.closeMenu();
  }
  cut = () => {
    this.sourceNode = this.contextMenu.node;
    this.doCut = true;
    this.closeMenu();
  }
  paste = () => {
    if (!this.canPaste()) {
      return;
    }
    this.doCut
      ? this.sourceNode.treeModel.moveNode(this.sourceNode, { parent: this.contextMenu.node, index: 9999999999999 })
      : this.sourceNode.treeModel.copyNode(this.sourceNode, { id: 999, parent: this.contextMenu.node, index: 9999999999999 });
    this.sourceNode = null;
    this.change = true;
    this.closeMenu();
  }
  canPaste = () => {
    if (!this.sourceNode) {
      return false;
    }
    return this.sourceNode.treeModel.canMoveNode(this.sourceNode, { parent: this.contextMenu.node, index: 0 });
  }
  edit = () => {
    this.editNode = this.contextMenu.node;
    this.closeMenu();
  }
  saveEdit = () => {
    this.change = true;
    this.editNode = null;
  }
  stopEdit = () => {
    this.editNode = null;
  }
  add = (tree) => {
    let node = this.contextMenu.node;
    this.mysql.newNode(node.id).subscribe((data: any) => {
      if (data.maxId) {
        //let newNode = { id: data.maxId, na: "新しい部屋", idx: 0, parent: node.id, discription: null, price: 0, typ: 0, folder: 0 };
        let room = new Room(data.maxId, node.id, "新しい部屋", 0);
        let rooms = JSON.parse(this.room);
        rooms.push(room);
        this.room = JSON.stringify(rooms);
        room.price = getPrice(node.id, rooms);
        if (!node.data.children) node.data.children = [];
        node.data.children.push(room);
        tree.treeModel.update();
        tree.treeModel.getNodeById(node.id).expandAll();
        let editNode = tree.treeModel.getNodeById(data.maxId);
        this.editNode = editNode;
      } else {
        alert("データーベースエラーにより新しい部屋の作成に失敗しました。");
      }
    });
    this.closeMenu();
    //TREE_ACTIONS.TOGGLE_ACTIVE(tree, newRoom, true);
  }
  del = (tree) => {
    this.change = true;
    let node = this.contextMenu.node;
    let parentNode = node.realParent ? node.realParent : node.treeModel.virtualRoot;
    _.remove(parentNode.data.children, function (child) {
      return child === node.data;
    });
    tree.treeModel.update();
    this.closeMenu();
    if (node.parent.data.children.length === 0) {
      node.parent.data.hasChildren = false;
    }
  }
  filterFn(value: string, treeModel: TreeModel) {
    treeModel.filterNodes((node: TreeNode) => fuzzysearch(value, node.data.name));
  }
  undo() {
    this.getNode();
    this.change = false;
  }
  save(treeModel: TreeModel) {
    var nodes = [];
    function addNodes(node) {
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          node.children[i].idx = i;
          node.children[i].folder = "children" in node.children[i] ? 1 : 0;
          node.children[i].parent = node.id;
          nodes.push(node.children[i]);
          addNodes(node.children[i]);
        }
      }
    }
    for (let i = 0; i < treeModel.nodes.length; i++) {
      //treeModel.nodes[i].idx = i;ルートノードは順番変更できない
      treeModel.nodes[i].folder = "children" in treeModel.nodes[i] ? 1 : 0;
      nodes.push(treeModel.nodes[i]);
      addNodes(treeModel.nodes[i]);
    }
    var sql = "";
    var rooms = JSON.parse(this.room);
    var maxId = Math.max(...rooms.map(room => room.id));
    const noProp = ["auth", "children", "amount", "billing_day", "trial_days", "price"];
    nodes.forEach((node) => {
      var val = "";
      let room = rooms.filter(room => { return room.id == node.id });
      if (room.length) {
        for (const p of Object.keys(room[0])) {
          if (!noProp.filter(prop => { return p === prop; }).length && room[0][p] !== node[p]) {
            if ((p === "na" || p === "discription") && node[p] !== null) {
              val += p + '="' + node[p] + '",';
            } else {
              val += p + "=" + node[p] + ",";
            }
          }
        }
        sql += val ? "UPDATE t01room SET " + val.substr(0, val.length - 1) + " WHERE id=" + room[0].id + ";\n" : "";
        rooms = rooms.filter(room => { return room.id != node.id; });
      } else {
        var key = "";
        if (node.id > 100000000000) { maxId++; node.id = maxId; }
        for (const p of Object.keys(node)) {
          if (!noProp.filter(prop => { return p === prop; }).length) {
            key += p + ","
            if ((p == "na" || p == "discription") && !(node[p] === null || node[p] === "null")) {
              val += '"' + node[p] + '",';
            } else {
              val += node[p] + ",";
            }
          }
        }
        sql += "INSERT INTO t01room (" + key.substr(0, key.length - 1) + ") VALUES (" + val.substr(0, val.length - 1) + ");\n";
      }
    });
    for (let i = 0; i < rooms.length; i++) {
      sql += "DELETE FROM t01room WHERE id=" + rooms[i].id + ";\n";
    }
    console.log(sql);
    this.mysql.saveNode(this.user ? this.user.uid : "AMavP9Icrfe7GbbMt0YCXWFWIY42", sql.substr(0, sql.length - 1)).subscribe((data: any) => {
      if (data.msg !== "ok") {
        this.change = false;
        this.getNode();
      } else {
        alert("データベースエラー C-Lifeまでお問合せください。");
      }
    });
  }
  constructor(private mysql: MysqlService) { }

  ngOnInit() {
    this.getNode();
  }
  getNode() {
    this.mysql.getNode(this.user ? this.user.uid : "AMavP9Icrfe7GbbMt0YCXWFWIY42").subscribe((rooms: any) => {
      this.room = JSON.stringify(rooms);
      var authRooms = rooms.filter(room => { return room.auth !== null; });
      var rootRooms = [];
      for (let i = 0; i < authRooms.length; i++) {
        if (!authRooms.filter(room => { return room.id === authRooms[i].parent }).length) {
          rootRooms.push(authRooms[i]);
        }
      }
      this.nodes = [];
      for (let i = 0; i < rootRooms.length; i++) {
        let res = addRooms(rootRooms[i].id, rooms);
        if (res.length) rootRooms[i].children = res;
        this.nodes.push(rootRooms[i]);
      }
    });
    function addRooms(parent, rooms) {
      var childs = [];
      let children = rooms.filter(node => { return node.parent === parent; });
      for (let i = 0; i < children.length; i++) {
        children[i].price = getPrice(children[i].parent, rooms);
        let res = addRooms(children[i].id, rooms);
        if (res.length) { children[i].children = res; }
        childs.push(children[i]);
      }
      return childs;
    }
  }
  getPrice(parent) {
    var price = 0;
    do {
      let parents = this.nodes.filter(node => { return node.id === parent; });
      if (parents.length) {
        price += parents[0].amount ? parents[0].amount : 0;
        parent = parents[0].id;
      }
    } while (parent.length)
    return price;
  }
}
function getPrice(parent, rooms) {
  var price = 0;
  do {
    let parents = rooms.filter(room => { return room.id === parent; });
    if (parents.length) {
      price += parents[0].amount ? parents[0].amount : 0;
      parent = parents[0].id;
    }
  } while (parent.length)
  return price;
}
function fuzzysearch(needle: string, haystack: string) {
  const haystackLC = haystack.toLowerCase();
  const needleLC = needle.toLowerCase();

  const hlen = haystack.length;
  const nlen = needleLC.length;

  if (nlen > hlen) {
    return false;
  }
  if (nlen === hlen) {
    return needleLC === haystackLC;
  }
  outer: for (let i = 0, j = 0; i < nlen; i++) {
    const nch = needleLC.charCodeAt(i);

    while (j < hlen) {
      if (haystackLC.charCodeAt(j++) === nch) {
        continue outer;
      }
    }
    return false;
  }
  return true;
}