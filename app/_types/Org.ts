export class Org {
  id: string;
  name: string;
  active: boolean;

  constructor(id: string, name: string, active: boolean = false) {
    this.id = id;
    this.name = name;
    this.active = active;
  }
}
