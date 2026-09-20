export class MenuUI {
  constructor(dom) { this.dom = dom; }
  hideAll() {
    ['inventoryModal', 'mapModal', 'systemModal', 'nameModal'].forEach((key) => {
      if (this.dom[key]) this.dom[key].hidden = true;
    });
  }
}
