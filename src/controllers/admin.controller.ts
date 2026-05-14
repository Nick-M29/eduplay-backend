import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// 1. Obtener todos los usuarios formateados
export const obtenerUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        profesor: true,
        alumno: true,
        padre: true,
      },
      orderBy: { fechaRegistro: 'desc' }
    });

    // Aplanamos los datos para que el Frontend los consuma fácilmente
    const usuariosFormateados = usuarios.map(u => ({
      id: u.id,
      email: u.email,
      rol: u.rol,
      // Buscamos el nombre en la tabla que corresponda
      nombreCompleto: u.profesor?.nombreCompleto || u.alumno?.nombreCompleto || u.padre?.nombreCompleto || '',
      fechaRegistro: u.fechaRegistro
    }));

    res.json(usuariosFormateados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// 2. Eliminar un usuario (Cascada borrará su perfil de Profesor/Alumno si está configurado en schema.prisma)
export const eliminarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.usuario.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};

// 3. Ascender a Administrador
export const hacerAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.usuario.update({
      where: { id: Number(id) },
      data: { rol: 'ADMIN' }
    });
    res.json({ message: 'Usuario ascendido a Administrador' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar permisos' });
  }
};

// 4. Crear un usuario manualmente desde el panel (YA VERIFICADO)
export const crearUsuario = async (req: Request, res: Response) => {
  try {
    const { email, password, rol, nombreCompleto } = req.body;
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = await prisma.$transaction(async (tx) => {
      const user = await tx.usuario.create({
        data: { 
          email, 
          passwordHash, 
          rol,
          // CLAVE: El usuario nace verificado para que no pida código
          verificado: true, 
          codigoVerificacion: null // Limpiamos el código por si acaso
        }
      });

      if (rol === 'PROFESOR') {
        await tx.profesor.create({ data: { usuarioId: user.id, nombreCompleto, fechaNacimiento: new Date() }});
      } else if (rol === 'ALUMNO') {
        const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
        await tx.alumno.create({ data: { usuarioId: user.id, nombreCompleto, codigoAcceso: codigo }});
      } else if (rol === 'PADRE') {
        await tx.padre.create({ data: { usuarioId: user.id, nombreCompleto, fechaNacimiento: new Date() }});
      } else if (rol === 'ADMIN') {
        // IMPORTANTE: Si creas un Admin, asegúrate de tener una tabla 'administrador' 
        // o guarda el nombre en el perfil que corresponda según tu esquema.
      }

      return user;
    });

    res.status(201).json({ message: 'Usuario creado y verificado con éxito', usuario: nuevoUsuario });
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ message: 'El email ya existe' });
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

export const editarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, nombreCompleto } = req.body; 

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: Number(id) },
      include: { profesor: true, alumno: true, padre: true }
    });

    if (!usuarioExistente) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Actualizamos los datos básicos del usuario
      await tx.usuario.update({
        where: { id: Number(id) },
        data: { email }
      });

      // 2. Actualizamos el nombre en su perfil correspondiente
      if (usuarioExistente.rol === 'PROFESOR') {
        await tx.profesor.update({ where: { usuarioId: Number(id) }, data: { nombreCompleto } });
      } else if (usuarioExistente.rol === 'ALUMNO') {
        await tx.alumno.update({ where: { usuarioId: Number(id) }, data: { nombreCompleto } });
      } else if (usuarioExistente.rol === 'PADRE') {
        await tx.padre.update({ where: { usuarioId: Number(id) }, data: { nombreCompleto } });
      } else if (usuarioExistente.rol === 'ADMIN') {
        // OPCIÓN A: Si el Admin también es Profesor (o usa esa tabla para el nombre)
        if (usuarioExistente.profesor) {
          await tx.profesor.update({ where: { usuarioId: Number(id) }, data: { nombreCompleto } });
        }
        // OPCIÓN B: Si tienes una tabla 'administrador', actualízala aquí.
      }
    });

    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ message: 'Email en uso' });
    res.status(500).json({ message: 'Error al actualizar' });
  }
};