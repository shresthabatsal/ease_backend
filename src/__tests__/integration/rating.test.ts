import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { RatingModel } from "../../models/rating.model";

describe("Rating Integration Tests", () => {
  const testUser = {
    fullName: "Rating Test User",
    email: "ratingtest@test.com",
    password: "password123",
    phoneNumber: "9811444555",
  };

  let userToken: string;
  let userId: string;
  let adminToken: string;
  let productId: string;
  let storeId: string;
  let categoryId: string;
  let subcategoryId: string;
  let ratingId: string;

  beforeAll(async () => {
    await UserModel.deleteMany({ email: testUser.email });

    const reg = await request(app).post("/api/auth/register").send(testUser);
    userId = reg.body.data._id;

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    userToken = login.body.token;

    const admin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@gmail.com", password: "pass123" });
    adminToken = admin.body.token;

    const storeRes = await request(app)
      .post("/api/admin/stores")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("storeName", "Rating Test Store")
      .field("location", "Boudha")
      .field("coordinates[latitude]", "27.721")
      .field("coordinates[longitude]", "85.362")
      .field("pickupInstructions", "Show OTP");
    storeId = storeRes.body.data._id;

    const catRes = await request(app)
      .post("/api/admin/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Rating Test Category" });
    categoryId = catRes.body.data._id;

    const subRes = await request(app)
      .post("/api/admin/subcategories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Rating Test Subcategory", categoryId });
    subcategoryId = subRes.body.data._id;

    const prodRes = await request(app)
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "Rating Test Product")
      .field("price", "300")
      .field("quantity", "10")
      .field("description", "For rating tests")
      .field("storeId", storeId)
      .field("categoryId", categoryId)
      .field("subcategoryId", subcategoryId)
      .attach(
        "productImage",
        "uploads/users/0d14c1e9-92de-4769-90d5-5b7cc51b1856-aisle.jpg"
      );
    productId = prodRes.body.data._id;
  });

  afterAll(async () => {
    await RatingModel.deleteMany({ userId });
    await request(app)
      .delete(`/api/admin/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    await request(app)
      .delete(`/api/admin/subcategories/${subcategoryId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    await request(app)
      .delete(`/api/admin/categories/${categoryId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    await request(app)
      .delete(`/api/admin/stores/${storeId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    await UserModel.deleteMany({ email: testUser.email });
  });

  // Get ratings
  it("should get ratings for product without auth (empty)", async () => {
    const res = await request(app).get(
      `/api/user/ratings/product/${productId}`
    );
    expect(res.status).toBe(200);
    expect(res.body.data.totalRatings).toBe(0);
    expect(res.body.data.ratings).toHaveLength(0);
  });

  // Create rating
  it("should create a rating", async () => {
    const res = await request(app)
      .post("/api/user/ratings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, rating: 4, review: "Really good product!" });

    expect(res.status).toBe(201);
    expect(res.body.data.rating).toBe(4);
    expect(res.body.data.review).toBe("Really good product!");
    ratingId = res.body.data._id;
  });

  it("should not create duplicate rating for same product", async () => {
    const res = await request(app)
      .post("/api/user/ratings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, rating: 5, review: "Second attempt" });
    expect(res.status).toBe(400);
  });

  // Update rating
  it("should update own rating", async () => {
    const res = await request(app)
      .put(`/api/user/ratings/${ratingId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ rating: 5, review: "Even better than I thought!" });

    expect(res.status).toBe(200);
    expect(res.body.data.rating).toBe(5);
  });

  // Delete rating
  it("should delete own rating", async () => {
    const res = await request(app)
      .delete(`/api/user/ratings/${ratingId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });
});
