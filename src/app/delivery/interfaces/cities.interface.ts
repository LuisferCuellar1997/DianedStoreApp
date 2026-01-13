export interface Departamento {
  id:                     number;
  name:                   string;
}


export interface City {
  id:                     number;
  name:                   string;
  postalCode:             null | string;
  departmentId:           number;
}
