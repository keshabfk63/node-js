import productModel from "../model/product/ProductModel";
import { generateOtp } from "../utilities/Helper";

class ProductService {
  async checkUniqueSlug(slug: string): Promise<string> {
    const exists = await productModel.findOne({
      slug: slug,
    });
    if (exists) {
      slug += "-" + generateOtp(6);
      return await this.checkUniqueSlug(slug);
    } else {
      return slug;
    }
  }
}
// export default ProductService;
export default new ProductService();
