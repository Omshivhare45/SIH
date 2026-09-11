export interface Station {
  code: string;
  name: string;
  city: string;
  state: string;
}

export interface RouteStation {
  stationCode: string;
  stationName: string;
  platform: number | string;
  scheduledArrival: string;
  scheduledDeparture: string;
  actualArrival: string;
  actualDeparture: string;
  distanceKm: number;
  day: number;
  haltMinutes: number;
  status: 'passed' | 'current' | 'approaching' | 'upcoming';
  delayMinutes: number;
  speedKmH?: number;
}

export interface SeatClass {
  type: '1A' | '2A' | '3A' | '3E' | 'SL' | 'CC' | 'EC' | '2S';
  name: string;
  price: number;
  status: string; // e.g., "AVL 45", "RAC 12", "WL 34"
  statusType: 'available' | 'rac' | 'waitlist' | 'regret';
  chance?: string;
}

export interface CoachInfo {
  code: string;
  type: string;
  name: string;
  seatsCount: number;
  hasPantry?: boolean;
}

export type TrainDirection = 'UP' | 'DOWN';

export interface PNRPassenger {
  serial: number;
  name: string;
  age: number;
  gender: 'M' | 'F';
  bookingStatus: string;
  currentStatus: string;
  coach?: string;
  berth?: string;
  berthType?: string;
}

export interface PNRRecord {
  pnr: string;
  trainNumber: string;
  trainName: string;
  journeyDate: string;
  boardingStation: string;
  boardingCode: string;
  destinationStation: string;
  destinationCode: string;
  classType: string;
  quota: string;
  bookingDate: string;
  chartPrepared: boolean;
  passengers: PNRPassenger[];
  fare: number;
  expectedPlatform: number | string;
  prediction: string;
}

export interface Train {
  id: string;
  trainNumber: string;
  trainName: string;
  type: 'Vande Bharat' | 'Rajdhani' | 'Shatabdi' | 'Tejas' | 'Duronto' | 'Superfast' | 'Express';
  direction: TrainDirection;
  pairTrainNumber: string;
  sourceCode: string;
  sourceName: string;
  destinationCode: string;
  destinationName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  distanceKm: number;
  runsOnDays: string[]; // ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  currentStatus: {
    statusText: string;
    delayMinutes: number;
    currentStationCode: string;
    currentStationName: string;
    nextStationCode: string;
    nextStationName: string;
    distanceCoveredKm: number;
    currentSpeedKmH: number;
    platform: number | string;
    lastUpdated: string;
    etaNextStation: string;
    distanceToNextKm: number;
    signalStatus: 'GREEN' | 'YELLOW' | 'DOUBLE_YELLOW' | 'RED';
    locoNumber: string;
    pantryAvailable: boolean;
  };
  classes: SeatClass[];
  coaches: CoachInfo[];
  route: RouteStation[];
}

export interface SearchFilters {
  source: string;
  destination: string;
  date: string;
  travelClass: string;
  quota: string;
}
