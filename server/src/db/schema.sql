CREATE TABLE
    IF NOT EXISTS worlds (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
    );

CREATE TABLE
    IF NOT EXISTS world_members (
        world_id UUID NOT NULL REFERENCES worlds (id) ON DELETE CASCADE,
        player_id TEXT NOT NULL,
        PRIMARY KEY (world_id, player_id)
    );

CREATE TABLE
    IF NOT EXISTS player_data (
        player_id TEXT NOT NULL,
        world_id UUID NOT NULL,
        position_x REAL DEFAULT 0,
        position_y REAL DEFAULT 0,
        health INTEGER DEFAULT 100,
        data JSONB DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT NOW (),
        PRIMARY KEY (player_id, world_id),
        FOREIGN KEY (world_id) REFERENCES worlds (id) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS world_state (
        world_id UUID PRIMARY KEY,
        entities JSONB DEFAULT '[]',
        chunks JSONB DEFAULT '{}',
        time JSONB DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT NOW (),
        FOREIGN KEY (world_id) REFERENCES worlds (id) ON DELETE CASCADE
    );