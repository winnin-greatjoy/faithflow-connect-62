import React, { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';

type FullCalendarProps = React.ComponentProps<typeof FullCalendar>;

const isInjectedMetadataKey = (key: string) =>
  key.startsWith('data-lov-') || key.startsWith('data-component-');

export const SafeFullCalendar: React.FC<FullCalendarProps> = (props) => {
  const sanitizedProps = useMemo(() => {
    const entries = Object.entries(props).filter(([key]) => !isInjectedMetadataKey(key));
    return Object.fromEntries(entries) as FullCalendarProps;
  }, [props]);

  return <FullCalendar {...sanitizedProps} />;
};

export default SafeFullCalendar;
