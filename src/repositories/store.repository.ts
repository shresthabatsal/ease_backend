import { StoreModel, IStore } from "../models/store.model";

export interface IStoreRepository {
  createStore(data: Partial<IStore>): Promise<IStore>;
  getAllStores(): Promise<IStore[]>;
  getStoreById(id: string): Promise<IStore | null>;
  updateStore(id: string, data: Partial<IStore>): Promise<IStore | null>;
  deleteStore(id: string): Promise<boolean>;
}

export class StoreRepository implements IStoreRepository {
  async createStore(data: Partial<IStore>): Promise<IStore> {
    const store = new StoreModel(data);
    return await store.save();
  }

  async getAllStores(): Promise<IStore[]> {
    return await StoreModel.find();
  }

  async getStoreById(id: string): Promise<IStore | null> {
    return await StoreModel.findById(id);
  }

  async updateStore(id: string, data: Partial<IStore>): Promise<IStore | null> {
    return await StoreModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteStore(id: string): Promise<boolean> {
    const result = await StoreModel.findByIdAndDelete(id);
    return !!result;
  }
}
