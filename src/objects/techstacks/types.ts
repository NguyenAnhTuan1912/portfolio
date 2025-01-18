export type TechType = {
  id: string;
  value: string;
  name: string;
};

export type TechRefType = {
  id: string;
};

export type TechStackRefType = {
  value: string;
  name: string;
  data: Array<TechRefType>;
};

export type TechStackType = {
  value: string;
  name: string;
  data: Array<TechType>;
};
