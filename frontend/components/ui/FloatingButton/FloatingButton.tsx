'use client';

import { Fab, Badge, Tooltip } from '@mui/material';
import { List as ListIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store';
import { selectObjectsMeta } from '@/store/slices/objectsSlice';

interface FloatingButtonProps {
  onClick: () => void;
}

export default function FloatingButton({ onClick }: FloatingButtonProps) {
  const { t } = useTranslation();
  const meta = useAppSelector(selectObjectsMeta);

  return (
    <Tooltip title={t('map.objects_list')} placement="right">
      <Fab
        color="primary"
        onClick={onClick}
        sx={{
          position: 'absolute',
          top: 140,
          left: 16,
          zIndex: 999,
        }}
      >
        <Badge
          badgeContent={meta?.total || 0}
          color="secondary"
          max={99}
        >
          <ListIcon />
        </Badge>
      </Fab>
    </Tooltip>
  );
}
