import { DocumentSnapshot } from "firebase/firestore";
export interface UserData {
  name: string;
  email: string;
  valid: boolean;
}

export class User implements UserData {
  id: string;
  name: string;
  email: string;
  valid: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    id: string,
    name: string,
    email: string,
    valid: boolean,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.valid = valid;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Creates a User object from a Firebase document snapshot
   * @param doc - Firebase document snapshot
   * @returns User object or null if document doesn't exist
   */
  static fromDoc(doc: DocumentSnapshot): User | null {
    if (!doc.exists()) {
      return null;
    }

    const data = doc.data();

    return new User(
      doc.id,
      data?.name ?? "",
      data?.email ?? "",
      data?.valid ?? false,
      data?.createdAt?.toDate(),
      data?.updatedAt?.toDate()
    );
  }
}
