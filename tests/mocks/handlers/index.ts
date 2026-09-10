import type { HttpHandler } from 'msw';
import { authHandlers } from './auth';
import { booksHandlers } from './books';
import { ordersHandlers } from './orders';
import { categoriesHandlers } from './categories';
import { settingsHandlers } from './settings';

// Combined handlers export - single location for the MSW server.
export const handlers: HttpHandler[] = [
  ...authHandlers,
  ...booksHandlers,
  ...ordersHandlers,
  ...categoriesHandlers,
  ...settingsHandlers,
];
