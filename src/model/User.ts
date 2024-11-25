export default class User {
  id?: number;
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  gender?: string;
  password?: string;
  country?: string;
  oneTimeKey?: string;
  isValidated?: boolean = false;
  isResetting?: boolean = false;
  isAdmin?: boolean = false;

  constructor(args: UserConstructor) {
    this.setProps(args);
  }

  setProps({
    id,
    name,
    surname,
    email,
    phone,
    gender,
    password,
    country,
    oneTimeKey,
    isValidated,
    isResetting,
    isAdmin,
  }: UserConstructor) {
    if (id != null) this.id = id;
    if (name != null) this.name = name;
    if (surname != null) this.surname = surname;
    if (email != null) this.email = email;
    if (phone != null) this.phone = phone;
    if (gender != null) this.gender = gender;
    if (password != null) this.password = password;
    if (country != null) this.country = country;
    if (oneTimeKey != null) this.oneTimeKey = oneTimeKey;
    if (isValidated != null) this.isValidated = isValidated;
    if (isAdmin != null) this.isAdmin = isAdmin;
  }
}

interface UserConstructor {
  id?: number;
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  gender?: string;
  password?: string;
  country?: string;
  oneTimeKey?: string;
  isValidated?: boolean;
  isResetting?: boolean;
  isAdmin?: boolean;
}