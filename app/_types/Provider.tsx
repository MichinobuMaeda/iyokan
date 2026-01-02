import { DocumentSnapshot } from "firebase/firestore";

export interface ProviderParam {
  key: string;
  value: string;
}

export interface ProviderData {
  type: string;
  name: string;
  params: ProviderParam[];
  valid: boolean;
}

export class Provider implements ProviderData {
  id: string;
  type: string;
  name: string;
  params: ProviderParam[];
  valid: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    id: string,
    type: string,
    name: string,
    params: ProviderParam[],
    valid: boolean,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.params = params;
    this.valid = valid;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Creates a Provider object from a Firebase document snapshot
   * @param doc - Firebase document snapshot
   * @returns Provider object or null if document doesn't exist
   */
  static fromDoc(doc: DocumentSnapshot): Provider | null {
    if (!doc.exists()) {
      return null;
    }

    const data = doc.data();

    return new Provider(
      doc.id,
      data?.type ?? "",
      data?.name ?? "",
      data?.params ?? [],
      data?.valid ?? false,
      data?.createdAt?.toDate(),
      data?.updatedAt?.toDate()
    );
  }
}
