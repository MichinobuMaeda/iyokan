export class ProviderParam {
  key: string;
  value: string;

  constructor(key: string, value: string) {
    this.key = key;
    this.value = value;
  }
}

export class Provider {
  id: string;
  name: string;
  type: string;
  params: Array<ProviderParam>;

  constructor(
    id: string,
    name: string,
    type: string,
    params: Array<ProviderParam> = []
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.params = params;
  }
}
