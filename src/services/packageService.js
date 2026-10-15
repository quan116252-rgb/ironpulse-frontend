import { packages } from "../data/mockData";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let store = [...packages];

export const getPackages = async () => {
  await delay(150);
  return [...store];
};

export const addPackage = async (p) => {
  await delay(150);
  const id = Math.max(0, ...store.map((x) => x.id)) + 1;
  store = [...store, { id, ...p }];
};

export const updatePackage = async (id, data) => {
  await delay(150);
  store = store.map((x) => (x.id === id ? { ...x, ...data } : x));
};

export const deletePackage = async (id) => {
  await delay(150);
  store = store.filter((x) => x.id !== id);
};
