import { StoreRepository } from "../../repositories/store.repository";
import { HttpError } from "../../errors/http.error";
import { CreateStoreDTOType, UpdateStoreDTOType } from "../../dtos/store.dto";

const storeRepository = new StoreRepository();

export class StoreService {
  async createStore(
    data: CreateStoreDTOType,
    storeImageFile?: Express.Multer.File,
    qrCodeFile?: Express.Multer.File
  ) {
    const storeData: any = { ...data };

    if (storeImageFile) {
      storeData.storeImage = `/uploads/users/${storeImageFile.filename}`;
    }

    if (qrCodeFile) {
      storeData.paymentQRCode = `/uploads/users/${qrCodeFile.filename}`;
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

  async getNearestStores(
    latitude: number,
    longitude: number,
    maxDistance: number = 50
  ) {
    if (!latitude || !longitude) {
      throw new HttpError(400, "Latitude and longitude are required");
    }

    const stores = await storeRepository.getNearestStores(
      latitude,
      longitude,
      maxDistance
    );

    return stores;
  }

  async updateStore(
    id: string,
    data: UpdateStoreDTOType,
    storeImageFile?: Express.Multer.File,
    qrCodeFile?: Express.Multer.File
  ) {
    const store = await storeRepository.getStoreById(id);
    if (!store) {
      throw new HttpError(404, "Store not found");
    }

    const updateData: any = { ...data };

    if (storeImageFile) {
      updateData.storeImage = `/uploads/users/${storeImageFile.filename}`;
    }

    if (qrCodeFile) {
      updateData.paymentQRCode = `/uploads/users/${qrCodeFile.filename}`;
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
