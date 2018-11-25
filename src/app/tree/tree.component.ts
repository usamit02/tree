import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { MysqlService } from '../service/mysql.service';
import { TREE_ACTIONS, KEYS, ITreeOptions, TreeNode, TreeModel, TreeDropDirective } from 'angular-tree-component';
import * as _ from 'lodash';
import { analyzeAndValidateNgModules } from '@angular/compiler';
@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {
  @Output() selected = new EventEmitter<TreeNode>();
  @ViewChild('tree') tree;
  user = { uid: "AMavP9Icrfe7GbbMt0YCXWFWIY42" };
  rooms = [];
  nodes = [];
  orgNodes = [];
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
          this.selected.emit(node);
          TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, e);
        },
        drop: (tree: TreeModel, node: TreeNode, e: MouseEvent, { from, to }) => {
          tree.moveNode(from, { parent: node, index: to.index });
          this.change = true;
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
      ? this.sourceNode.treeModel.moveNode(this.sourceNode, { parent: this.contextMenu.node, index: 0 })
      : this.sourceNode.treeModel.copyNode(this.sourceNode, { parent: this.contextMenu.node, index: 0 });
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
  add = (tree) => {
    this.change = true;
    let newRoom = new TreeNode({ na: "新しい部屋" }, this.contextMenu.node, tree.treeModel, 0);
    tree.treeModel.copyNode(newRoom, { parent: this.contextMenu.node, index: 0 });
    tree.treeModel.update();
  }
  del = (tree) => {
    this.change = true;
    let node = this.contextMenu.node;
    let parentNode = node.realParent ? node.realParent : node.treeModel.virtualRoot;
    _.remove(parentNode.data.children, function (child) {
      return child === node.data;
    });
    tree.treeModel.update();
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
          node.children[i].num = i;
          node.children[i].parent = node.id;
          nodes.push(node.children[i]);
          addNodes(node.children[i]);
        }
      }
    }
    for (let i = 0; i < treeModel.nodes.length; i++) {
      treeModel.nodes[i].num = i;
      nodes.push(treeModel.nodes[i]);
      addNodes(treeModel.nodes[i]);
    }
    var sql = "";
    nodes.forEach((node) => {
      var val = "";
      let com = this.orgNodes.filter(n => { return n.id == node.id });
      if (com.length) {
        for (const p of Object.keys(com[0])) {
          if (!(p == "allow" || com[0][p] == node[p] || (com[0][p] === null && node[p] === "null"))) {
            if ((p == "na" || p == "discription") && !(node[p] === "null")) {
              val += p + '="' + node[p] + '",';
            } else {
              val += p + "=" + node[p] + ",";
            }
          }
        }
        sql += val ? "UPDATE t01room SET " + val.substr(0, val.length - 1) + " WHERE id=" + com[0].id + ";\n" : "";
        this.orgNodes = this.orgNodes.filter(n => { return n.id != node.id; });
      } else {
        var key = "";
        for (const p of Object.keys(node)) {
          if (p != "children") {
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
    for (let i = 0; i < this.orgNodes.length; i++) {
      sql += "DELETE FROM t01room WHERE id=" + this.orgNodes[i].id + ";\n";
    }
    console.log(sql);
    /*
    this.mysql.saveNode(this.user ? this.user.uid : "AMavP9Icrfe7GbbMt0YCXWFWIY42", sql.substr(0, sql.length - 1)).subscribe((data: any) => {
      if (data.msg === "ok") {
        this.change = false;
        this.getNode();
      } else {
        alert("データベースエラー C-Lifeまでお問合せください。");
      }
    });
    */
  }
  constructor(private mysql: MysqlService) { }

  ngOnInit() {
    //this.readRooms();
    this.getNode();
  }
  readRooms() {
    this.mysql.room(this.user ? this.user.uid : "AMavP9Icrfe7GbbMt0YCXWFWIY42").subscribe((data: any) => {
      this.rooms = data;
      // this.addRooms(0, data);
    });
  }
  getNode() {
    this.mysql.getNode(this.user ? this.user.uid : "AMavP9Icrfe7GbbMt0YCXWFWIY42").subscribe((data: any) => {
      this.orgNodes = data.filter(d => { return d.id !== "0"; });
      let rootNodes = [];
      var json = "";
      for (let i = 0; i < data.length; i++) {
        if (!data.filter(d => { return d.id === data[i].parent }).length) {
          rootNodes.push(data[i]);
        }
      }
      for (let i = 0; i < rootNodes.length; i++) {
        json += addNodes(rootNodes[i].id, this.orgNodes).substr(11);
      }
      this.nodes = JSON.parse(json);
    });
    function addNodes(parent, nodes): string {
      let json = "";
      let res = nodes.filter(n => { return n.parent === parent; });
      if (res.length) {
        json = '"children":[';
        for (let i = 0; i < res.length; i++) {
          json += '{"id":' + res[i].id + ',"na":"' + res[i].na + '","discription":"' + res[i].discription + '","price":'
            + res[i].price + ',"parent":' + res[i].parent + ',"num":' + res[i].num + ',"typ":' + res[i].typ;
          let j: string = addNodes(res[i].id, nodes);
          json += j ? ',' + j : "";
          json += '},';
        }
        json = json.substr(0, json.length - 1) + ']';
      }
      return json;
    }
  }

  /*addRooms(parent, rooms) {
    let layerRooms = rooms.filter(r => { if (r.parent === parent) return true; });
    for (let i = 0; i < layerRooms.length; i++){
      
      if (this.addRooms(layerRooms[i], rooms)) {
        this.nodes.push(layerRooms[i])
      }
    }
  }
  */
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