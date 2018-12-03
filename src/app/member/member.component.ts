import { Component, Input, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { MysqlService } from '../service/mysql.service';
import { TREE_ACTIONS, KEYS, ITreeOptions, TreeNode, TreeModel, TreeDropDirective } from 'angular-tree-component';
import { Room } from '../class';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss']
})
export class MemberComponent implements OnInit {
  @Input()
  set room(room: Room) {
    this.getNode(room);
    this._room = room;
  }
  get room() {
    return this._room;
  }
  @Input() user;
  @Output() selected = new EventEmitter<Room>();
  @ViewChild('tree') tree;
  private _room: Room;
  users: string;
  rooms = [];
  nodes = [];
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
          if (this.contextMenu && node === this.contextMenu.node || (!this.doCut && node.data.id > -2) || node.data.room !== this.room.id) {
            return this.closeMenu();
          }
          this.contextMenu = {
            node: node,
            x: 100,
            y: e.pageY
          };
        },
        click: (tree: TreeModel, node: TreeNode, e: MouseEvent) => {
          this.closeMenu();
          this.selected.emit(node.data);
          TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, e);
        },
        drop: (tree: TreeModel, node: TreeNode, e: MouseEvent, { from, to }) => {
          if (node.parent && node.id > -1) {
            tree.moveNode(from, { parent: node, index: to.index });
            nodeNum(this.tree);
            this.tree.treeModel.update();
            this.change = true;
          } else {
            alert("そこには移動できません。");
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
      if (node.id > -2) {
        return false;
      } else {
        if (node.data.room === this.room.id) {
          return true;
        } else {
          return false;
        }
      }
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
  cut = () => {
    this.sourceNode = this.contextMenu.node;
    this.doCut = true;
    this.closeMenu();
  }
  paste = () => {
    if (!this.canPaste()) {
      return;
    }
    if (this.doCut) {
      this.sourceNode.treeModel.moveNode(this.sourceNode, { parent: this.contextMenu.node, index: 9999999999999 });
      this.doCut = false;
    }
    this.sourceNode = null;
    this.change = true;
    nodeNum(this.tree);
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
  filterFn(value: string, treeModel: TreeModel) {
    treeModel.filterNodes((node: TreeNode) => fuzzysearch(value, node.data.name));
  }
  undo() {
    this.getNode(this.room);
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
    var rooms = JSON.parse(this.users);
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
    /*
      this.mysql.saveNode(this.room ? this.room : "AMavP9Icrfe7GbbMt0YCXWFWIY42", sql.substr(0, sql.length - 1)).subscribe((data: any) => {
        if (data.msg !== "ok") {
          this.change = false;
          this.getNode(this.room);
        } else {
          alert("データベースエラー C-Lifeまでお問合せください。");
        }
      });*/
  }
  constructor(private mysql: MysqlService) { }

  ngOnInit() {

  }
  public getNode(room) {
    this.mysql.query("owner/member.php", { room: room.id }).subscribe((users: any) => {
      this.users = JSON.stringify(users);
      this.nodes = [
        { id: -1, na: "審査待ち", children: [], num: "" },
        { id: 0, na: "メンバー", children: [], num: "" },
        { id: 1, na: "マネージャー", children: [], num: "" },
        { id: 2, na: "クリエイター", children: [], num: "" },
        { id: 3, na: "マスター", children: [], num: "" },
        {
          id: 99, children: [
            { id: 100, na: "検索した人をドラッグして役職や会員に追加できます。" }
          ]
        }
      ]
      this.nodes.forEach(node => {
        let children = users.filter(user => { return user.auth === node.id; });
        if (children.length) {
          node.children = children;
          node.num = '(' + children.length + ')';
        }
      });
    });
  }
  search(x: string) {
    this.mysql.query("owner/member.php", { search: x }).subscribe((users: any) => {
      this.nodes[5].children = [];
      if (users.length === 50) {
        this.nodes[5].children.push({ id: 100, na: "50人以上該当しています。\n全てを表示できません。" });
      }
      if (users.length) {
        for (let i = 0; i < users.length; i++) {
          let node = { id: users[i].id, na: users[i].na, room: this.room.id };
          this.nodes[5].children.push(node);
        }
      } else {
        this.nodes[5].children.push({ id: 100, na: "誰もいない。" });
      }
      this.tree.treeModel.update();
      const node = this.tree.treeModel.getNodeById(99);
      node.expand();
    });
  }
  clearSearch() {
    let input = <HTMLInputElement>document.getElementById("search");
    input.value = "";
  }
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
function nodeNum(tree) {
  for (let i = 0; i < tree.treeModel.nodes.length; i++) {
    let num = tree.treeModel.nodes[i].children.length;
    tree.treeModel.nodes[i].num = num ? "(" + num + ")" : "";
  }
}