import { Module } from '@nestjs/common';

import { ThemeController } from './theme.controller.js';
import { ThemeCreateUc } from './uc/theme-create.uc.js';
import { ThemeDeleteUc } from './uc/theme-delete.uc.js';
import { ThemeGetUc } from './uc/theme-get.uc.js';
import { ThemeSearchUc } from './uc/theme-search.uc.js';
import { ThemeUpdateUc } from './uc/theme-update.uc.js';

@Module({
  controllers: [ThemeController],
  providers: [ThemeSearchUc, ThemeGetUc, ThemeCreateUc, ThemeUpdateUc, ThemeDeleteUc],
})
export class ThemeModule {}
