import { DocumentSnapshot } from "firebase/firestore";

export interface OrgData {
  name: string;
  desc?: string;
  active: boolean;
}

export class Org implements OrgData {
  id: string;
  name: string;
  desc?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    id: string,
    name: string,
    desc: string | undefined,
    active: boolean,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.name = name;
    this.desc = desc;
    this.active = active;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Creates an Org object from a Firebase document snapshot
   * @param doc - Firebase document snapshot
   * @returns Org object or null if document doesn't exist
   */
  static fromDoc(doc: DocumentSnapshot): Org | null {
    if (!doc.exists()) {
      return null;
    }

    const data = doc.data();

    return new Org(
      doc.id,
      data?.name ?? "",
      data?.desc,
      data?.active ?? false,
      data?.createdAt?.toDate(),
      data?.updatedAt?.toDate()
    );
  }
}
