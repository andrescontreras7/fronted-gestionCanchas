import { getCourts } from '@/lib/server-actions';
import UserCourtsComponents from '@/modules/courts/components/UserCourtsComponents';
import React from 'react';

const page = async () => {
  const courts = await getCourts();

  return <UserCourtsComponents courts={courts} />;
}

export default page;


