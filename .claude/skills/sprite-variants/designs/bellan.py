SOURCE = "bear"
TARGET = "bellan"
SHEETS = ["idle", "walking", "running", "standing", "slashing"]

PELT = [0x252527, 0x2E2E31, 0x3B3B40, 0x44444D, 0x52525C, 0x595B66, 0x626674]
FLEECE = [0x5E5047, 0x716154, 0x806F5D, 0x998374, 0xAC947E, 0xC3AC8C, 0xCDB88F]


def rgb(c):
    return ((c >> 16) & 255, (c >> 8) & 255, c & 255)


def pick(ramp, t):
    return rgb(ramp[max(0, min(len(ramp) - 1, round(t * (len(ramp) - 1))))])


def remap(r, g, b, a):
    if a < 255:
        return None
    if r > 150 and g < 110 and b < 40:
        return None
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    if lum < 140:
        return pick(PELT, (lum - 40) / 85) + (a,)
    return pick(FLEECE, (lum - 150) / 80) + (a,)
