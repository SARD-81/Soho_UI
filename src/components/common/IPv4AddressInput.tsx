import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  TextField,
  Typography,
} from '@mui/material';
import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  buildIPv4FromOctets,
  parseIPv4ToOctets,
  sanitizeOctetValue,
} from '../../utils/ipAddress';

interface IPv4AddressInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  helperText?: string;
  error?: boolean;
}

const createInputId = (label: string) =>
  `ipv4-input-${label.toLowerCase().replace(/\s+/g, '-')}`;

const IPv4AddressInput = ({
  label,
  value,
  onChange,
  required = false,
  helperText,
  error = false,
}: IPv4AddressInputProps) => {
  const [octets, setOctets] = useState(() => parseIPv4ToOctets(value));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setOctets(parseIPv4ToOctets(value));
  }, [value]);

  const inputId = useMemo(() => createInputId(label), [label]);

  const focusOctet = (index: number) => {
    const element = inputRefs.current[index];

    if (element) {
      element.focus();
      element.select();
    }
  };

  const updateOctet = (index: number, rawValue: string) => {
    const sanitizedValue = sanitizeOctetValue(rawValue);
    const nextOctets = [...octets];
    nextOctets[index] = sanitizedValue;

    setOctets(nextOctets);
    onChange(buildIPv4FromOctets(nextOctets));

    if (sanitizedValue.length === 3 && index < nextOctets.length - 1) {
      focusOctet(index + 1);
    }
  };

  const handleChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    updateOctet(index, event.target.value);
  };

  const handleKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    const { key } = event;

    if (key === '.') {
      event.preventDefault();
      if (index < octets.length - 1) {
        focusOctet(index + 1);
      }
      return;
    }

    if (key === 'Backspace' && target.selectionStart === 0 && target.selectionEnd === 0) {
      if (octets[index] === '' && index > 0) {
        focusOctet(index - 1);
      }
      return;
    }

    if (key === 'ArrowLeft' && target.selectionStart === 0 && index > 0) {
      event.preventDefault();
      focusOctet(index - 1);
    }

    if (
      key === 'ArrowRight' &&
      target.selectionStart === (target.value ?? '').length &&
      index < octets.length - 1
    ) {
      event.preventDefault();
      focusOctet(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pastedText = event.clipboardData.getData('text');
    const parts = parseIPv4ToOctets(pastedText);

    if (parts.some((part) => part !== '')) {
      event.preventDefault();
      const sanitizedOctets = parts.map(sanitizeOctetValue);
      setOctets(sanitizedOctets);
      onChange(buildIPv4FromOctets(sanitizedOctets));
      if (sanitizedOctets[0] !== '' && inputRefs.current[0]) {
        inputRefs.current[0]?.select();
      }
    }
  };

  return (
    <FormControl fullWidth error={error} required={required} variant="standard">
      {/* Added shrink to keep label at the top and avoid overlap */}
      <InputLabel 
        htmlFor={inputId} 
        shrink 
        sx={{ 
          color: 'var(--color-secondary)',
          right: 'auto', 
        //   right: 0, 
          transformOrigin: 'top left' 
        }}
      >
        {label}
      </InputLabel>
      
      <Box
        id={inputId}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          // Changed to 'rtl' to reverse the order (1st octet on the Right)
          direction: 'rtl', 
          flexWrap: 'wrap',
          // Added margin top so the inputs don't sit on top of the label
          marginTop: 4, 
        }}
        role="group"
        aria-label={label}
      >
        {octets.map((octet, index) => (
          <Box key={`${label}-octet-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              value={octet}
              onChange={handleChange(index)}
              onKeyDown={handleKeyDown(index)}
              onPaste={handlePaste}
              required={required}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                maxLength: 3,
                style: { textAlign: 'center' },
              }}
              size="small"
              sx={{
                width: 72,
                '& .MuiInputBase-input': {
                  color: 'var(--color-text)',
                  py: 1,
                },
              }}
              inputRef={(node) => {
                inputRefs.current[index] = node;
              }}
            />
            {index < octets.length - 1 ? (
              <Typography component="span" sx={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
                .
              </Typography>
            ) : null}
          </Box>
        ))}
      </Box>
      {helperText ? <FormHelperText sx={{ textAlign: 'right' }}>{helperText}</FormHelperText> : null}
    </FormControl>
  );
};

export default IPv4AddressInput;