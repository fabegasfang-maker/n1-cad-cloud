/** Scene ส่งจาก API ไปเว็บ — ย่อเพื่อลดแรมลูกค้า */

export type SceneLayer = {
  name: string;
  color?: string;
  visible: boolean;
};

export type SceneLine = {
  t: 'L';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  layer?: string;
  color?: string;
};

export type SceneText = {
  t: 'T';
  x: number;
  y: number;
  text: string;
  h?: number;
  layer?: string;
  color?: string;
};

export type SceneEntity = SceneLine | SceneText | Record<string, unknown>;

export type CadScene = {
  filename: string;
  fileId?: string;
  modifiedTime?: string;
  profile?: 'desktop' | 'mobile';
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  layers: SceneLayer[];
  entities: SceneEntity[];
  entityCount: number;
};

export type LatestFileMeta = {
  id: string;
  name: string;
  size?: number;
  modifiedTime?: string;
  monthFolder?: string;
};
