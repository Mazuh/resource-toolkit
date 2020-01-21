export interface ResourceState {
  items: Entity[];
  isCreating: boolean,
  isReadingBlind: boolean,
  reading: Identifier[];
  updating: Identifier[];
  deleting: Identifier[];
  lastMessage?: Message;
}

export interface ResourceAction<T extends string> {
  type: T;
  payload: ResourceIntent;
}

export interface ResourceIntent {
  step: Step;
  operation: Operation;
  identifying?: Identifier | Identifier[];
  content?: Entity | Entity[];
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
);

export interface Message {
  text: string;
  isError: boolean;
};

export interface Entity {
  [key: string]: any;
}

export type IdentifierKey = string;

export type Identifier = string | number;

export interface Gateway {
  getOne?: () => Promise<any>;
  getMany?: () => Promise<any>;
}
