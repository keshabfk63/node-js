import categoryModel from "../model/category/CategoryModel";
import { generateOtp } from "../utilities/Helper";

class CategoryServices {
  async checkUniqueSlug(slug: string): Promise<string> {
    const exist = await categoryModel.findOne({
      slug: slug,
    });
    if (exist) {
      slug += "-" + generateOtp(6);
      return await this.checkUniqueSlug(slug);
    } else {
      return slug;
    }
  }
}
export default new CategoryServices();
