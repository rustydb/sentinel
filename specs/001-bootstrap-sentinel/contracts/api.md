# API Contracts

## Express Backend API Endpoints

### Health Check

- **Endpoint**: `GET /api/health`
- **Response**: `{ "status": "ok", "service": "string", "timestamp": "ISO8601" }`

### Network Nodes

- **Endpoint**: `GET /api/network-nodes`
- **Description**: Returns all node-to-system mappings.

- **Endpoint**: `POST /api/network-nodes/:id/solar-system`
- **Description**: Upserts a mapping for a node.

- **Endpoint**: `DELETE /api/network-nodes/:id/solar-system`
- **Description**: Deletes the mapping for a node.

## GraphQL Queries (Sui Data)

1. `GET_CHARACTER_AND_OWNED_OBJECTS`: Fetches wallet's character and all owned objects.
2. `GET_OBJECT_WITH_JSON`: Returns single object with Move contents JSON.
3. `GET_TURRET_EVENTS`: Paginated event query filtered by type.
