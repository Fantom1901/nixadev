// providers/data-provider/index.ts
"use client";

import dataProviderSimpleRest from "@refinedev/simple-rest";
import { DataProvider, BaseRecord, GetOneParams, GetOneResponse } from "@refinedev/core";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = `${BASE_URL.replace(/\/+$/, "").replace(/\/api\/v1$/, "")}/api/v1`;

const baseProvider = dataProviderSimpleRest(API_URL);

export const dataProvider: DataProvider = {
  ...baseProvider,

  // Фиксим custom, чтобы он ВСЕГДА шёл на API_URL
  custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
    // Если url не начинается с http, принудительно делаем его абсолютным от API_URL
    const requestUrl = url.startsWith("http")
      ? url
      : `${API_URL}/${url.replace(/^\/+/, "")}`;

    return baseProvider.custom!({
      url: requestUrl,
      method,
      filters,
      sorters,
      payload,
      query,
      headers,
    });
  },

  getOne: async <TData extends BaseRecord = BaseRecord>(
    params: GetOneParams
  ): Promise<GetOneResponse<TData>> => {
    const { resource, id } = params;
    const cleanResource = resource.replace(/\/+$/, "");

    const { data } = await baseProvider.getList<TData>({
      resource: cleanResource,
    });

    const item = data.find(
      (record: any) =>
        String(record.id ?? record.uuid ?? record._id) === String(id)
    );

    if (!item) {
      throw new Error(`Элемент с id ${id} не найден в ресурсе ${resource}`);
    }

    return {
      data: item,
    };
  },
};