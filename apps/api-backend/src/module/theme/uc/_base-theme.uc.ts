import { Theme } from "@repo/db";
import { ThemeDetailResponseType, ThemeListResponseType } from "@repo/dto";
import { BaseUc, CommonLoggerService, PrismaService,ThemeDao } from "@repo/nest-lib";
import { ApiError } from "@repo/shared";

export class BaseThemeUc extends BaseUc {

  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly themeDao: ThemeDao,
  ) {
    super(prisma, logger);
  }

  async getById(id: number): Promise<ThemeDetailResponseType | undefined> {
    const theme = await this.themeDao.getById({ id });
    if (!theme) {
      return undefined;
    }
    return {
      id: theme.id,
      title: theme.title,
      description: theme.description ?? undefined,
      createdAt: theme.createdAt.toISOString(),
      updatedAt: theme.updatedAt.toISOString(),
    };
  }

  protected dbToThemeListResponse(dbRec: Theme): ThemeListResponseType {
    return {
      id: dbRec.id,
      title: dbRec.title,
      description: dbRec.description ?? undefined,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }

  async getByIdOrThrow(id: number): Promise<ThemeDetailResponseType> {
    const theme = await this.getById(id);
    if (!theme) {
      throw new ApiError('Theme not found', 404);
    }
    return theme;
  }
}
