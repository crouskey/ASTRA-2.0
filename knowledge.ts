// server/services/knowledge.ts
import { 
  addKnowledgeNode, 
  addKnowledgeRelation, 
  getKnowledgeNodes,
  logEvent,
  saveEmbedding,
} from '../utils/supabase';
import { extractKnowledge, generateEmbedding } from './openai';

/**
 * Interface for an entity in the knowledge graph
 */
export interface Entity {
  type: string;
  name: string;
  attributes?: Record<string, any>;
}

/**
 * Interface for a relationship in the knowledge graph
 */
export interface Relationship {
  source: string;
  target: string;
  type: string;
}

/**
 * Process text to extract knowledge and update the knowledge graph
 */
export const processTextForKnowledge = async (
  text: string,
  source: string,
  userId: string
): Promise<{ entities: string[], relationships: string[] }> => {
  try {
    // Extract knowledge from text using OpenAI
    const { entities, relationships } = await extractKnowledge(text);
    
    // Track created nodes and relationships for return
    const createdEntities: string[] = [];
    const createdRelationships: string[] = [];
    
    // Process each entity
    for (const entity of entities) {
      // Create structured content from attributes if present
      let content = '';
      if (entity.attributes) {
        content = JSON.stringify(entity.attributes);
      }
      
      // Add the entity to the knowledge graph
      const node = await addKnowledgeNode(
        entity.type,
        entity.name,
        content,
        source
      );
      
      // Generate embedding for the entity
      const embedding = await generateEmbedding(`${entity.type}: ${entity.name} - ${content}`);
      
      // Save embedding for future retrieval
      await saveEmbedding(
        'knowledge_node',
        node.id,
        `${entity.type}: ${entity.name} - ${content}`,
        embedding
      );
      
      createdEntities.push(entity.name);
      
      // Log this event
      await logEvent(
        'knowledge_extraction',
        `Added entity: ${entity.name} (${entity.type})`,
        node.id,
        'knowledge_node'
      );
    }
    
    // Process each relationship
    for (const relationship of relationships) {
      // Find source and target nodes
      const sourceNodes = await getKnowledgeNodes().then(nodes => 
        nodes.filter(node => node.name.toLowerCase() === relationship.source.toLowerCase())
      );
      
      const targetNodes = await getKnowledgeNodes().then(nodes => 
        nodes.filter(node => node.name.toLowerCase() === relationship.target.toLowerCase())
      );
      
      // Skip if either source or target is missing
      if (sourceNodes.length === 0 || targetNodes.length === 0) {
        console.warn(`Skipping relationship: ${relationship.source} -[${relationship.type}]-> ${relationship.target} (nodes not found)`);
        continue;
      }
      
      // Create the relationship
      const sourceNode = sourceNodes[0];
      const targetNode = targetNodes[0];
      
      const relation = await addKnowledgeRelation(
        sourceNode.id,
        targetNode.id,
        relationship.type
      );
      
      createdRelationships.push(`${relationship.source} -[${relationship.type}]-> ${relationship.target}`);
      
      // Log this event
      await logEvent(
        'knowledge_extraction',
        `Added relationship: ${sourceNode.name} -[${relationship.type}]-> ${targetNode.name}`,
        relation.id,
        'knowledge_relation'
      );
    }
    
    return {
      entities: createdEntities,
      relationships: createdRelationships,
    };
  } catch (error) {
    console.error('Error processing text for knowledge:', error);
    throw error;
  }
};

/**
 * Query the knowledge graph for information related to a topic
 */
export const queryKnowledge = async (
  topic: string,
  userId: string
): Promise<{
  directEntities: any[];
  relatedEntities: any[];
  relationships: any[];
}> => {
  try {
    // Get all knowledge nodes
    const allNodes = await getKnowledgeNodes();
    
    // Find entities directly matching the topic
    const directEntities = allNodes.filter(node => 
      node.name.toLowerCase().includes(topic.toLowerCase())
    );
    
    // Get relationships involving direct entities
    const directEntityIds = directEntities.map(entity => entity.id);
    
    // This would be a more complex query in Supabase to get relationships
    // Here we're simplifying for illustration
    const relationships = await getRelationships(directEntityIds);
    
    // Find related entities through relationships
    const relatedEntityIds = new Set<string>();
    
    for (const relationship of relationships) {
      if (directEntityIds.includes(relationship.source_id)) {
        relatedEntityIds.add(relationship.target_id);
      }
      if (directEntityIds.includes(relationship.target_id)) {
        relatedEntityIds.add(relationship.source_id);
      }
    }
    
    // Remove direct entities from related entities
    directEntityIds.forEach(id => relatedEntityIds.delete(id));
    
    // Get the actual node objects for related entities
    const relatedEntities = allNodes.filter(node => 
      Array.from(relatedEntityIds).includes(node.id)
    );
    
    return {
      directEntities,
      relatedEntities,
      relationships,
    };
  } catch (error) {
    console.error('Error querying knowledge:', error);
    throw error;
  }
};

/**
 * Helper function to get relationships for a set of node IDs
 * This would be implemented using Supabase queries
 */
const getRelationships = async (nodeIds: string[]) => {
  // This is a placeholder for a Supabase query
  // In a real implementation, we would query the knowledge_relations table
  // to find all relationships where source_id or target_id is in nodeIds
  
  // For now, we'll return an empty array
  return [];
};

/**
 * Generate a timeline of events from the knowledge graph
 */
export const generateTimeline = async (userId: string): Promise<any[]> => {
  try {
    // Query the events table for timeline data
    // This would be a Supabase query in a real implementation
    const events = await getEvents(userId);
    
    // Sort events by timestamp
    return events.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error generating timeline:', error);
    throw error;
  }
};

/**
 * Helper function to get events for a user
 * This would be implemented using Supabase queries
 */
const getEvents = async (userId: string) => {
  // This is a placeholder for a Supabase query
  // In a real implementation, we would query the events table
  
  // For now, we'll return an empty array
  return [];
};

export default {
  processTextForKnowledge,
  queryKnowledge,
  generateTimeline,
};