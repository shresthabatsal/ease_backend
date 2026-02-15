import { StoreRepository } from "../../repositories/store.repository";
import { HttpError } from "../../errors/http.error";
import { CreateStoreDTOType, UpdateStoreDTOType } from "../../dtos/store.dto";

const storeRepository = new StoreRepository();

export class StoreService {
  async createStore(data: CreateStoreDTOType, file?: Express.Multer.File) {
    const storeData: any = { ...data };
    if (file) {
      storeData.storeImage = `/uploads/stores/${file.filename}`;
    }
    return await storeRepository.createStore(storeData);
  }

  async getAllStores() {
    return await storeRepository.getAllStores();
  }

  async getStoreById(id: string) {
    const store = await storeRepository.getStoreById(id);
    if (!store) {
      throw new HttpError(404, "Store not found");
    }
    return store;
  }

  async updateStore(
    id: string,
    data: UpdateStoreDTOType,
    file?: Express.Multer.File
  ) {
    const store = await storeRepository.getStoreById(id);
    if (!store) {
      throw new HttpError(404, "Store not found");
    }
    const updateData: any = { ...data };
    if (file) {
      updateData.storeImage = `/uploads/stores/${file.filename}`;
    }
    return await storeRepository.updateStore(id, updateData);
  }

  async deleteStore(id: string) {
    const store = await storeRepository.getStoreById(id);
    if (!store) {
      throw new HttpError(404, "Store not found");
    }
    return await storeRepository.deleteStore(id);
  }
}
