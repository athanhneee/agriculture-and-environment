import { Request, Response, NextFunction } from 'express';
import { SearchService } from './search.service';
import { ApiResponse } from '../../utils/apiResponse';
import { JwtPayload } from '../../utils/jwt';

export class SearchController {
  static async globalSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string) || '';
      const user = req.user as JwtPayload;
      
      const results = await SearchService.globalSearch(query, user);
      
      res.status(200).json(ApiResponse.success('Search results fetched successfully', results));
    } catch (error) {
      next(error);
    }
  }
}
