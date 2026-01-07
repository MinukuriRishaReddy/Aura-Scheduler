export type User = {
  id: string;
  email: string;
  name: string;
  role: 'host' | 'user';
};

export type Venue = {
  id: string;
  name: string;
  capacity: number;
  description: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  venue_id: string;
  date: string;
  start_time: string;
  end_time: string;
  registration_link: string;
  host_id: string;
  created_at: string;
};