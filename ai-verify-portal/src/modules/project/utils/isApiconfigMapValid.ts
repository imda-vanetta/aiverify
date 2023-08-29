import {
  BodyParam,
  UrlParam,
} from 'src/modules/assets/modelAPIComponent/types';

type RequestParams =
  | Omit<BodyParam, 'reactPropId'>[]
  | Omit<UrlParam, 'reactPropId'>[];

export function isApiconfigMapValid(
  map: Record<string, string>,
  params: RequestParams
): boolean {
  if (Object.keys(map).length !== Object.keys(params).length) {
    return false;
  }

  for (const key in map) {
    if (!map[key]) {
      return false;
    }
  }
  return true;
}
