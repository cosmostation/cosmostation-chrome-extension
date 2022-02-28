import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';

import {
  Container,
  DescriptionContainer,
  InfoContainer,
  InfoItemContainer,
  InfoItemLeftContainer,
  InfoItemRightContainer,
  InputContainer,
  StyledButton,
  StyledInput,
} from './styled';
import type { HDPathForm } from './useSchema';
import { useSchema } from './useSchema';

const HD_PATH_INFOS = [
  { name: 'Cosmos', path: "m/44'/118'/0'/0" },
  { name: 'Ethereum', path: "m/44'/80'/0'/0" },
];

type HDPathDialogProps = Omit<DialogProps, 'children'> & {
  onSubmitHdPath?: (data: HDPathForm) => void;
  currentAddressIndex?: number;
};

export default function HDPathDialog({ onClose, onSubmitHdPath, currentAddressIndex, ...remainder }: HDPathDialogProps) {
  const [addressIndex, setAddressIndex] = useState(0);

  const { hdPathForm } = useSchema();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<HDPathForm>({
    resolver: joiResolver(hdPathForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const handleOnClose = () => {
    reset();
    onClose?.({}, 'backdropClick');
  };

  const submit = (data: HDPathForm) => {
    onSubmitHdPath?.(data);
    handleOnClose();
  };

  return (
    <Dialog {...remainder} onClose={handleOnClose}>
      <DialogHeader onClose={handleOnClose}>HD path setting</DialogHeader>
      <form onSubmit={handleSubmit(submit)}>
        <Container>
          <DescriptionContainer>
            <Typography variant="h6">Above are derivation paths for Cosmos, Ethereum, and Bitcoin.</Typography>
          </DescriptionContainer>
          <InfoContainer>
            {HD_PATH_INFOS.map((info) => (
              <InfoItemContainer key={info.name}>
                <InfoItemLeftContainer>
                  <Typography variant="h5">{info.name}</Typography>
                </InfoItemLeftContainer>
                <InfoItemRightContainer>
                  <Typography variant="h5">{`${info.path}/${addressIndex || currentAddressIndex || '0'}`}</Typography>
                </InfoItemRightContainer>
              </InfoItemContainer>
            ))}
          </InfoContainer>
          <InputContainer>
            <StyledInput
              inputProps={register('addressIndex', {
                setValueAs: (v: number) => {
                  setAddressIndex(v);
                  return v;
                },
              })}
              type="number"
              placeholder={`${currentAddressIndex || '0'}`}
              error={!!errors.addressIndex}
              helperText={errors.addressIndex?.message}
            />
          </InputContainer>
          <StyledButton type="submit" disabled={!isDirty}>
            Confirm
          </StyledButton>
        </Container>
      </form>
    </Dialog>
  );
}
