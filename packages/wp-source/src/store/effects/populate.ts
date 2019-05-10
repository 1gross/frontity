import { normalize } from "normalizr";
import * as schemas from "../../schemas";
import { Context, DataPage } from "../../types";

export const populate = async (
  state: Context["state"]["source"],
  response: Response
): Promise<DataPage> => {
  // Normalize response
  const json = await response.json();
  const isList = json instanceof Array;
  const { entities, result } = normalize(
    json,
    isList ? schemas.list : schemas.entity
  );

  // type, id and link of added entities
  const entityList: DataPage = (isList ? result : [result]).map(
    ({ id: entityId, schema }) => {
      const { type, id, link } = entities[schema][entityId];
      return { type, id, link };
    }
  );

  // add entities to state
  Object.entries(entities).forEach(([schema, entityMap]) => {
    Object.entries(entityMap).forEach(([, entity]) => {
      if (schema === "postType" || schema === "attachment") {
        if (state[entity.type]) state[entity.type][entity.id] = entity;
      } else if (schema === "taxonomy") {
        if (state[entity.taxonomy]) state[entity.taxonomy][entity.id] = entity;
      } else if (schema === "author") {
        state.author[entity.id] = entity;
      }
    });
  });

  return entityList;
};
