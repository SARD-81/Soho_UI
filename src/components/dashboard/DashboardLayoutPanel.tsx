import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  MdClose,
  MdLayers,
  MdOutlineLayersClear,
  MdOutlineSettingsBackupRestore,
} from 'react-icons/md';

export interface DashboardLayoutPanelOption {
  id: string;
  label: string;
  description?: string;
  isDefault?: boolean;
}

export interface DashboardLayoutPanelWidget {
  id: string;
  title: string;
  description?: string;
  options: DashboardLayoutPanelOption[];
  activeOptionId: string;
  hidden: boolean;
}

interface DashboardLayoutPanelProps {
  open: boolean;
  widgets: DashboardLayoutPanelWidget[];
  onClose: () => void;
  onToggleWidget: (widgetId: string) => void;
  onSelectLayout: (widgetId: string, optionId: string) => void;
  onHideAll: () => void;
  onShowAll: () => void;
  onReset: () => void;
  isDirty: boolean;
}

const DashboardLayoutPanel = ({
  open,
  widgets,
  onClose,
  onToggleWidget,
  onSelectLayout,
  onHideAll,
  onShowAll,
  onReset,
  isDirty,
}: DashboardLayoutPanelProps) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}>
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontFamily: 'var(--font-vazir)' }}>
          Manage dashboard widgets
        </Typography>
        <Tooltip title="Close">
          <IconButton onClick={onClose} size="small">
            <MdClose />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          fontFamily: 'var(--font-vazir)',
          flex: 1,
          overflowY: 'auto',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Toggle widgets on or off, choose their footprint and drag cards directly on the dashboard to reorder them.
        </Typography>
        {widgets.map((widget) => {
          const hasMultipleOptions = widget.options.length > 1;
          return (
            <Box
              key={widget.id}
              sx={{
                borderRadius: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'rgba(0, 0, 0, 0.02)',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {widget.title}
                  </Typography>
                  {widget.description ? (
                    <Typography variant="body2" color="text.secondary">
                      {widget.description}
                    </Typography>
                  ) : null}
                </Box>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Typography variant="caption" color="text.secondary">
                    Visible
                  </Typography>
                  <Switch
                    edge="end"
                    color="primary"
                    checked={!widget.hidden}
                    onChange={() => onToggleWidget(widget.id)}
                  />
                </Stack>
              </Stack>
              {hasMultipleOptions ? (
                <ToggleButtonGroup
                  value={widget.activeOptionId}
                  exclusive
                  onChange={(_, optionId: string | null) => {
                    if (!optionId) return;
                    onSelectLayout(widget.id, optionId);
                  }}
                  fullWidth
                  orientation="vertical"
                  sx={{
                    '& .MuiToggleButton-root': {
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      fontFamily: 'var(--font-vazir)',
                      gap: 1,
                      py: 1.25,
                      px: 1.5,
                    },
                  }}
                >
                  {widget.options.map((option) => (
                    <ToggleButton key={option.id} value={option.id} sx={{ position: 'relative' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Typography variant="body2" sx={{ fontWeight: option.isDefault ? 600 : 500 }}>
                            {option.label}
                          </Typography>
                          {option.isDefault ? (
                            <Typography variant="caption" color="text.secondary">
                              پیش‌فرض
                            </Typography>
                          ) : null}
                        </Stack>
                        {option.description ? (
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        ) : null}
                      </Box>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              ) : null}
            </Box>
          );
        })}
      </Box>
      <Divider />
      <Box sx={{ px: 3, py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<MdOutlineLayersClear />}
          onClick={onHideAll}
        >
          Hide all
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<MdLayers />}
          onClick={onShowAll}
        >
          Show all
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<MdOutlineSettingsBackupRestore />}
          onClick={onReset}
          disabled={!isDirty}
        >
          Reset to defaults
        </Button>
      </Box>
    </Drawer>
  );
};

export default DashboardLayoutPanel;
