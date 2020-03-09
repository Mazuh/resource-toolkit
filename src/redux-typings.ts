export interface ResourceState {
  items: Entity[];
  relatedsTo: IndexedRelationships;
  isCreating: boolean;
  isReadingBlindly: boolean;
  reading: Identifier[];
  updating: Identifier[];
  deleting: Identifier[];
  isLoading: boolean;
  finishingLogs: Message[];
  currentMessage?: Message;
}

export interface ResourceAction<T extends string> {
  type: T;
  payload: ResourceIntent;
}

export interface ResourceIntent {
  operation: Operation;
  step: Step;
  identifying?: Identifier | Identifier[];
  content?: Entity | Entity[] | Error;
  relationshipKey?: string,
}

export type Step = (
  | 'DOING'
  | 'SUCCESS'
  | 'ERROR'
);

export type Operation = (
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'RELATED'
  | 'RELATED_CREATED'
  | 'RELATED_READ'
  | 'RELATED_UPDATED'
  | 'RELATED_DELETED'
  | 'CLEAR_ITEMS'
  | 'CLEAR_CURRENT_MESSAGE'
);

export interface Message {
  text: string;
  isError: boolean;
  causedByError?: Error | null,
};

export interface Entity {
  [key: string]: any;
}

export interface RelatedToOne {
  item: Entity,
  isLoading: boolean;
}

export interface RelatedToMany {
  items: Entity[],
  isLoading: boolean;
}

export interface Relationships {
  [key: string]: (RelatedToOne | RelatedToMany);
}

export interface IndexedRelationships {
  [key: string]: Relationships;
};

export const ONE_RELATED = 'one';
export const MANY_RELATED = 'many';
export type RelatedType = (
  | typeof ONE_RELATED
  | typeof MANY_RELATED
);

export type IdentifierKey = string;

export type Identifier = string | number;

export const EMPTY_INITIAL_STATE: ResourceState = Object.freeze({
  items: [],
  relatedsTo: {},
  isCreating: false,
  isReadingBlindly: false,
  reading: [],
  updating: [],
  deleting: [],
  isLoading: false,
  finishingLogs: [],
  currentMessage: null,
});

export interface Gateway {
  create?: (...args: any[]) => Promise<Entity | Entity[]>;
  fetchOne?: (identifier: Identifier, ...args: any[]) => Promise<Entity>;
  fetchMany?: (identifiers?: Identifier[], ...args: any[]) => Promise<Entity[]>;
  update?: (identifier: Identifier, ...args: any[]) => Promise<Entity>;
  delete?: (identifier: Identifier, ...args: any[]) => Promise<Entity | void>;
  createRelated?: (...args: any[]) => Promise<Entity>;
  fetchRelated?: (...args: any[]) => Promise<Entity | Entity[]>;
  updateRelated?: (...args: any[]) => Promise<Entity>;
  deleteRelated?: (...args: any[]) => Promise<Entity>;
}
