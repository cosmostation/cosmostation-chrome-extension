import InputAdornment from '@mui/material/InputAdornment';

import { Container, FilterIconButton, StyledCircularProgress, StyledInput } from './styled';
import IconButton from '../common/IconButton';
import type { OutlinedInputProps } from '../common/OutlinedInput';

import DeleteIcon from '@/assets/images/icons/Delete14.svg';
import FilterSettingIcon from '@/assets/images/icons/FilterSetting18.svg';
import SearchIcon from '@/assets/images/icons/Search18.svg';

export type SearchProps = OutlinedInputProps & {
  searchPlaceholder?: string;
  isPending?: boolean;
  disableFilter?: boolean;
  onClickFilter?: () => void;
  onClear?: () => void;
};

export default function Search({ searchPlaceholder, disableFilter, isPending, onClickFilter, onClear, ...remainder }: SearchProps) {
  return (
    <Container>
      <StyledInput
        startAdornment={
          <InputAdornment
            position="start"
            sx={{
              marginRight: '0.6rem',
            }}
          >
            <SearchIcon />
          </InputAdornment>
        }
        placeholder={searchPlaceholder || 'Search'}
        {...remainder}
        endAdornment={
          isPending ? (
            <StyledCircularProgress size={14} />
          ) : remainder.value ? (
            <InputAdornment position="end">
              <IconButton onClick={onClear}>
                <DeleteIcon />
              </IconButton>
            </InputAdornment>
          ) : null
        }
      />
      {!disableFilter && (
        <FilterIconButton onClick={onClickFilter}>
          <FilterSettingIcon />
        </FilterIconButton>
      )}
    </Container>
  );
}
