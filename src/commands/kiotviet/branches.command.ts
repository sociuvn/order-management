import * as kiotvietService from '../../services/kiotviet.service';

const listBranchesCommand = async () => {
  try {
    kiotvietService.listBranches();
  } catch (error) {
    // Print the error
    console.error(error.message);
  }
};

export { listBranchesCommand };
