-- 1. CREACIÓN DE TIPOS ENUMERADOS (ENUMs)
-- Esto restringe los valores que pueden ir en estas columnas para evitar errores tipográficos.
CREATE TYPE rol_usuario AS ENUM ('PROFESOR', 'PADRE', 'ALUMNO');
CREATE TYPE audiencia_material AS ENUM ('ALUMNOS', 'PADRES', 'AMBOS');

-- 2. GESTIÓN DE USUARIOS Y ROLES

CREATE TABLE Usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol rol_usuario NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Profesores (
    usuario_id INT PRIMARY KEY REFERENCES Usuarios(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL
);

CREATE TABLE Alumnos (
    usuario_id INT PRIMARY KEY REFERENCES Usuarios(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(255) NOT NULL,
    codigo_acceso VARCHAR(50) UNIQUE NOT NULL,
    puntos INT DEFAULT 0 CHECK (puntos >= 0), -- Evita puntos negativos
    avatar_json JSONB -- JSONB es ideal en Postgres para guardar atributos del avatar
);

CREATE TABLE Padres (
    usuario_id INT PRIMARY KEY REFERENCES Usuarios(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL
);

-- Tabla intermedia para conectar padres y alumnos (Relación Muchos a Muchos)
CREATE TABLE Padre_Alumno (
    padre_id INT REFERENCES Padres(usuario_id) ON DELETE CASCADE,
    alumno_id INT REFERENCES Alumnos(usuario_id) ON DELETE CASCADE,
    PRIMARY KEY (padre_id, alumno_id)
);

-- 3. GESTIÓN DE CLASES Y ASISTENCIA

CREATE TABLE Clases (
    id SERIAL PRIMARY KEY,
    profesor_id INT REFERENCES Profesores(usuario_id) ON DELETE CASCADE,
    nombre_clase VARCHAR(255) NOT NULL,
    codigo_clase VARCHAR(50) UNIQUE NOT NULL,
    clave_ingreso VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla intermedia para alumnos matriculados en una clase
CREATE TABLE Clase_Alumno (
    clase_id INT REFERENCES Clases(id) ON DELETE CASCADE,
    alumno_id INT REFERENCES Alumnos(usuario_id) ON DELETE CASCADE,
    PRIMARY KEY (clase_id, alumno_id)
);

CREATE TABLE Hojas_Seguimiento (
    id SERIAL PRIMARY KEY,
    clase_id INT REFERENCES Clases(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    UNIQUE (clase_id, fecha) -- Evita que un profesor cree dos listas de asistencia el mismo día
);

CREATE TABLE Registros_Asistencia (
    hoja_id INT REFERENCES Hojas_Seguimiento(id) ON DELETE CASCADE,
    alumno_id INT REFERENCES Alumnos(usuario_id) ON DELETE CASCADE,
    asistio BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (hoja_id, alumno_id)
);

-- 4. MATERIAL DIDÁCTICO

CREATE TABLE Materiales (
    id SERIAL PRIMARY KEY,
    clase_id INT REFERENCES Clases(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    audiencia audiencia_material NOT NULL,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. SISTEMAS DE COMUNICACIÓN

-- Mensajes entre padres y profesores (y publicaciones de muro)
CREATE TABLE Mensajes_Padres_Profesores (
    id SERIAL PRIMARY KEY,
    clase_id INT REFERENCES Clases(id) ON DELETE CASCADE,
    remitente_id INT REFERENCES Usuarios(id) ON DELETE CASCADE,
    destinatario_id INT REFERENCES Usuarios(id) ON DELETE CASCADE, -- Si es NULL, se considera un mensaje público
    es_publico BOOLEAN DEFAULT FALSE,
    texto TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat interno y exclusivo para alumnos
CREATE TABLE Chats_Alumnos (
    id SERIAL PRIMARY KEY,
    clase_id INT REFERENCES Clases(id) ON DELETE CASCADE,
    remitente_id INT REFERENCES Alumnos(usuario_id) ON DELETE CASCADE,
    destinatario_id INT REFERENCES Alumnos(usuario_id) ON DELETE CASCADE, -- Si es NULL, es un mensaje al grupo de la clase
    texto TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);