class Thing {
  constructor() {
  }

  public method() {
    console.log('not called!');
  }
}

export class TypeClass {
  private thing: Thing;

  constructor() {
    this.thing = new Thing();
  }
}