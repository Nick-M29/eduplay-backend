import { PrismaClient, RolUsuario } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando el sembrado de datos (Seed)...');

  const passwordHashDefault = await bcrypt.hash('password123', 10);

  // ---------------------------------------------------------
  // 1. LA CORONACIÓN DEL ADMINISTRADOR
  // ---------------------------------------------------------
  const adminEmail = "nick3m9220@gmail.com";
  const adminPasswordHash = await bcrypt.hash('CambiaEstaClave123!', 10);

  console.log(`👑 Coronando al Administrador Supremo: ${adminEmail}...`);

  await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {
      rol: RolUsuario.ADMIN, // Usando tu enum RolUsuario
      verificado: true,
      passwordHash: adminPasswordHash
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      rol: RolUsuario.ADMIN,
      verificado: true,
    }
  });

  console.log(`✅ ¡ÉXITO! El usuario ${adminEmail} es ADMINISTRADOR.`);
  console.log('---------------------------------------------------------');

  // ---------------------------------------------------------
  // 2. GENERACIÓN DE DATOS DE PRUEBA (LABORATORIO)
  // ---------------------------------------------------------
  console.log('🧪 Generando datos de prueba (1 Profesor, 3 Clases, 24 Alumnos)...');

  // Limpieza en el orden correcto para evitar errores de Foreign Key
  await prisma.claseAlumno.deleteMany(); // Borrar matriculas primero
  await prisma.alumno.deleteMany();
  await prisma.clase.deleteMany();
  await prisma.profesor.deleteMany();
  
  await prisma.usuario.deleteMany({
    where: { NOT: { email: adminEmail } }
  });

  // Crear el Profesor
  const userProfesor = await prisma.usuario.create({
    data: {
      email: 'profe@eduplay.com',
      passwordHash: passwordHashDefault,
      rol: RolUsuario.PROFESOR,
      verificado: true,
      profesor: {
        create: {
          nombreCompleto: 'Maestro de Gremio Galáctico',
          fechaNacimiento: new Date('1985-05-15'),
        }
      }
    },
    include: { profesor: true }
  });

  console.log('👨‍🏫 Profesor de prueba creado (profe@eduplay.com)');

  // Crear 3 Clases
  for (let i = 1; i <= 3; i++) {
    const clase = await prisma.clase.create({
      data: {
        nombreClase: `Clase de Aventureros ${i}`,
        codigoClase: `CLASE-AVN-${i}-${Math.floor(Math.random() * 1000)}`, // Debe ser único
        claveIngreso: `AVENTURA${i}`,
        profesorId: userProfesor.id, // El ID de usuario del profesor
      }
    });

    console.log(`🏰 Creada Clase ${i}: ${clase.nombreClase}`);

    // Crear 8 Alumnos para esta clase
    for (let j = 1; j <= 8; j++) {
      const alumnoEmail = `alumno${i}_${j}@eduplay.com`;
      
      const nuevoAlumno = await prisma.usuario.create({
        data: {
          email: alumnoEmail,
          passwordHash: passwordHashDefault,
          rol: RolUsuario.ALUMNO,
          verificado: true,
          alumno: {
            create: {
              nombreCompleto: `Aprendiz ${j} del Grupo ${i}`,
              codigoAcceso: `ACC${i}${j}${Math.floor(Math.random() * 1000)}`, // Debe ser único
              puntos: Math.floor(Math.random() * 100),
            }
          }
        }
      });

      // MATRICULAR AL ALUMNO EN LA CLASE (Tabla intermedia ClaseAlumno)
      await prisma.claseAlumno.create({
        data: {
          claseId: clase.id,
          alumnoId: nuevoAlumno.id, // El ID del usuario que creamos
        }
      });
    }
    console.log(`   👥 8 alumnos creados y matriculados en la clase ${i}`);
  }

  console.log('🚀 ¡Seed completado con éxito!');
}

main()
  .catch((e) => {
    console.error('❌ Error fatal en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });