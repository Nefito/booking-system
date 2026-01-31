import { PrismaClient, DayOfWeek, ResourceStatus } from '@prisma/client';
import { SlugUtil } from '../utils/slug.util';

export async function seedResources(prisma: PrismaClient) {
  console.log('Seeding resources...');

  // First, ensure categories exist
  const meetingRoomCategory = await prisma.category.upsert({
    where: { name: 'Meeting Room' },
    update: {},
    create: { name: 'Meeting Room' },
  });

  const equipmentCategory = await prisma.category.upsert({
    where: { name: 'Equipment' },
    update: {},
    create: { name: 'Equipment' },
  });

  const serviceCategory = await prisma.category.upsert({
    where: { name: 'Service' },
    update: {},
    create: { name: 'Service' },
  });

  // Sample resources
  const resources = [
    {
      name: 'Conference Room A',
      description: 'Large conference room with video conferencing equipment',
      status: ResourceStatus.active,
      location: 'Building 1, Floor 2, Room 201',
      durationMinutes: 60,
      operatingStart: '09:00:00',
      operatingEnd: '18:00:00',
      availableDays: [
        DayOfWeek.monday,
        DayOfWeek.tuesday,
        DayOfWeek.wednesday,
        DayOfWeek.thursday,
        DayOfWeek.friday,
      ],
      capacity: 20,
      price: 50.0,
      bufferTimeMinutes: 15,
      advanceBookingLimitDays: 30,
      categoryId: meetingRoomCategory.id,
    },
    {
      name: 'Small Meeting Room B',
      description: 'Intimate meeting space for small teams',
      status: ResourceStatus.active,
      location: 'Building 1, Floor 2, Room 202',
      durationMinutes: 30,
      operatingStart: '08:00:00',
      operatingEnd: '20:00:00',
      availableDays: [
        DayOfWeek.monday,
        DayOfWeek.tuesday,
        DayOfWeek.wednesday,
        DayOfWeek.thursday,
        DayOfWeek.friday,
      ],
      capacity: 6,
      price: 25.0,
      bufferTimeMinutes: 10,
      advanceBookingLimitDays: 14,
      categoryId: meetingRoomCategory.id,
    },
    {
      name: 'Projector',
      description: 'High-definition projector for presentations',
      status: ResourceStatus.active,
      location: 'Equipment Storage',
      durationMinutes: 120,
      operatingStart: '09:00:00',
      operatingEnd: '17:00:00',
      availableDays: [
        DayOfWeek.monday,
        DayOfWeek.tuesday,
        DayOfWeek.wednesday,
        DayOfWeek.thursday,
        DayOfWeek.friday,
      ],
      capacity: 1,
      price: 15.0,
      bufferTimeMinutes: 0,
      advanceBookingLimitDays: 7,
      categoryId: equipmentCategory.id,
    },
    {
      name: 'Photography Session',
      description: 'Professional photography service',
      status: ResourceStatus.active,
      location: 'Studio A',
      durationMinutes: 90,
      operatingStart: '10:00:00',
      operatingEnd: '16:00:00',
      availableDays: [DayOfWeek.monday, DayOfWeek.wednesday, DayOfWeek.friday],
      capacity: 1,
      price: 150.0,
      bufferTimeMinutes: 30,
      advanceBookingLimitDays: 60,
      categoryId: serviceCategory.id,
    },
  ];

  for (const resourceData of resources) {
    const slug = await SlugUtil.generateUnique(resourceData.name, async (slug) => {
      const existing = await prisma.resource.findUnique({
        where: { slug },
      });
      return !!existing;
    });

    await prisma.resource.upsert({
      where: { slug },
      update: resourceData,
      create: {
        ...resourceData,
        slug,
      },
    });
  }

  console.log(`Seeded ${resources.length} resources`);
}
