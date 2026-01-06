import { UserRegistration } from '@/features/users';
import { Images } from 'assets/images';
import type { ImageSourcePropType, TextInput as RNTextInput } from 'react-native';

export const EXPERIENCE_LEVELS:{id: UserRegistration['experience_level'],
  label: string,
  description: string,
  image: ImageSourcePropType,
}[] = [
  {
    id: 'INTERNSHIP',
    label: 'Internships',
    description: 'Looking for internship opportunities',
    image: Images.experience.internship,
  },
  {
    id: 'FRESHER_OR_LESS_THAN_1_YEAR',
    label: 'Fresher or experience < 1 Year',
    description: 'Just starting out',
    image: Images.experience.lessThanOne,
  },
  {
    id: 'ONE_TO_THREE_YEARS',
    label: '1 - 3 Years Experience',
    description: 'Building experience',
    image: Images.experience.oneToThree,
  },
  {
    id: 'three-to-five',
    label: '3 - 5 Years Experience',
    description: 'Mid-level professional',
    image: Images.experience.threeToFive,
  },
  {
    id: 'five-plus',
    label: '5+ Years Experience',
    description: 'Senior professional',
    image: Images.experience.fivePlus,
  },
] as const;