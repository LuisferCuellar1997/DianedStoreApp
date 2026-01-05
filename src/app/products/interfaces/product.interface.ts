export interface Product{

  id:string,
  brand:string,
  color:string[],
  description:string,
  gender:string,
  category:string,
  images:string[],
  price:number,
  reference:string,
  stock:Stock[]
}

export interface Stock{
  size:string,
  stock:number
}

export interface Jean extends Product{
  isHighlighter:boolean
}
