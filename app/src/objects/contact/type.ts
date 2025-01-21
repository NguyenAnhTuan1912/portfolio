export type ContactType = {
  id: string;
  name: string;
  value: string;
  url: string;
};

export type ContactStackType = {
  name: string;
  value: string;
  data: Array<ContactType>;
};
