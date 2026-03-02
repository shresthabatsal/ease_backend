import { StoreModel, IStore } from "../models/store.model";

export interface IStoreRepository {
  createStore(data: Partial<IStore>): Promise<IStore>;
  getAllStores(): Promise<IStore[]>;
  getStoreById(id: string): Promise<IStore | null>;
  updateStore(id: string, data: Partial<IStore>): Promise<IStore | null>;
  deleteStore(id: string): Promise<boolean>;
  getNearestStores(
    latitude: number,
    longitude: number,
    maxDistance: number
  ): Promise<Array<IStore & { distance: number }>>;
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

  async getNearestStores(
    latitude: number,
    longitude: number,
    maxDistance: number
  ): Promise<Array<IStore & { distance: number }>> {
    const stores = await StoreModel.find();

    // Calculate distance using Haversine formula
    const storesWithDistance: Array<any> = stores
      .map((store) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          store.coordinates.latitude,
          store.coordinates.longitude
        );

        const storeObj = store.toObject() as any;
        return {
          ...storeObj,
          distance: Math.round(distance * 100) / 100, // Round to 2 decimals
        };
      })
      .filter((store) => store.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);

    return storesWithDistance as Array<IStore & { distance: number }>;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }
}
