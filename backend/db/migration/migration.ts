import { CBSModel } from "../../src/api/cbs/cbsModel";
import { CostInModel } from "../../src/api/cost_in/costInModel";
import { CostItemDescriptionModel } from "../../src/api/cost_item_description/costItemDescriptionModel";
import { CostItemModel } from "../../src/api/cost_items/costItemModel";
import { CostRecordModel } from "../../src/api/cost_records/costRecordModel";
import { ProgressModel } from "../../src/api/progress/progressModel";
import { ProjectCBSModel } from "../../src/api/project_cbs/projectCbsModel";
import { ProjectModel } from "../../src/api/projects/projectModel";
import { TerminModel } from "../../src/api/termin/terminModel";
import { TerminAllocationModel } from "../../src/api/termin_allocations/terminAllocationModel";
import { UserModel } from "../../src/api/user/userModel";
import { VendorModel } from "../../src/api/vendor/vendorModel";
import { WBSModel } from "../../src/api/wbs/wbsModel";
import { WbsCostModel } from "../../src/api/wbs_cost/wbsCostModel";

export async function Migrate(): Promise<boolean> {
	try {
		await UserModel.sync({ alter: true });
		await CBSModel.sync({ alter: true });
		await ProjectModel.sync({ alter: true });
		await ProjectCBSModel.sync({ alter: true });
		await WBSModel.sync({ alter: true });
		await WbsCostModel.sync({ alter: true });
		await TerminModel.sync({ alter: true });
		await TerminAllocationModel.sync({ alter: true });
		await VendorModel.sync({ alter: true });
		await CostRecordModel.sync({ alter: true });
		await CostItemModel.sync({ alter: true });
		await CostItemDescriptionModel.sync({ alter: true });
		await ProgressModel.sync({ alter: true });
		await CostInModel.sync({ alter: true });
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}
