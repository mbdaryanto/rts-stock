import { ReactNode } from 'react'
import { Button, IconButton, List, ListItem } from '@chakra-ui/react'
import { min, range } from 'lodash'
import { FaArrowLeft, FaArrowRight, FaEllipsisH } from 'react-icons/fa'

function Paginate({ count, pageSize, pageCount, pageNo, onChangePage, size }: {
  count?: number,
  pageSize?: number,
  pageCount?: number,
  pageNo: number,
  onChangePage: (pageNo: number, start?: number, end?: number) => void,
  size?: "lg" | "md" | "sm" | "xs"
}) {
  if (!pageCount && count !== undefined && !!pageSize) {
    pageCount = pageCount || Math.floor((count + pageSize - 1) / pageSize)
    console.log('paginate', count, pageCount)
  } else if (pageCount === undefined) {
    throw Error('Either pageCount or count and pageSize props is expected')
  }

  const changeToPage = (newPageNo: number) => {
    if (!!count && !!pageSize) {
      onChangePage(newPageNo, (newPageNo - 1) * pageSize, min([newPageNo * pageSize, count]))
    } else {
      onChangePage(newPageNo)
    }
  }

  const pageButton = (p: number) => (
    <Button variant={pageNo===p ? "solid" : "outline"} size={size} colorScheme={pageNo===p ? "teal" : undefined} onClick={() => changeToPage(p)}>{p}</Button>
  )

  const ellipsis = (
    <Button variant="outline" size={size} disabled><FaEllipsisH/></Button>
  )

  const prevButton = (
    <IconButton variant="outline" size={size} aria-label="previous page" icon={<FaArrowLeft/>} onClick={() => {
      if (pageNo > 1) {
        changeToPage(pageNo - 1)
      }
    }}/>
  )

  const nextButton = (
    <IconButton variant="outline" size={size} aria-label="next page" icon={<FaArrowRight/>} onClick={() => {
      if (pageNo < pageCount!) {
        changeToPage(pageNo + 1)
      }
    }}/>
  )

  if (pageNo < 1 || pageNo > pageCount) {
    changeToPage(1);
  }

  if (pageCount === 0) {
    return <></>;
  }

  let pageNav: ReactNode[] = []

  pageNav.push((<ListItem key="prev">{prevButton}</ListItem>))

  // prev 1 2 ... n-2 n-1 n n+1 n+2 ... pageCount-1 pageCount next
  // prev 1 2  3   4   5  6  7   8   9  10 11 next

  if (pageCount <= 11) {
    // urut biasa
    range(1, pageCount + 1).map((p) => pageNav.push((<ListItem key={p}>{pageButton(p)}</ListItem>)))
  } else if (pageNo <= 5) {
    // setelah 1, 8  elipsis  p-1 p
    range(1, 9).map((p) => pageNav.push((<ListItem key={p}>{pageButton(p)}</ListItem>)))
    pageNav.push((<ListItem key="r_ellipsis">{ellipsis}</ListItem>))
    range(pageCount - 1, pageCount + 1).map((p) => pageNav.push((<ListItem key={p}>{pageButton(p)}</ListItem>)))
  } else if (pageNo >= pageCount - 5) {
    // setelah 1, 2  elipsis  p-7 p-1 p
    range(1, 3).map((p) => pageNav.push((<ListItem key={p}>{pageButton(p)}</ListItem>)))
    pageNav.push((<ListItem key="l_ellipsis">{ellipsis}</ListItem>))
    range(pageCount - 7, pageCount + 1).map((p) => pageNav.push((<ListItem key={p}>{pageButton(p)}</ListItem>)))
  } else {
    range(1, 3).map((p) => pageNav.push((<ListItem key={p}>{pageButton(p)}</ListItem>)))
    pageNav.push((<ListItem key="l_ellipsis">{ellipsis}</ListItem>))
    range(pageNo - 2, pageNo + 3).map((p) => pageNav.push((<ListItem key={p}>{pageButton(p)}</ListItem>)))
    pageNav.push((<ListItem key="r_ellipsis">{ellipsis}</ListItem>))
    range(pageCount - 1, pageCount + 1).map((p) => pageNav.push((<ListItem key={p}>{pageButton(p)}</ListItem>)))
  }

  pageNav.push((<ListItem key="next">{nextButton}</ListItem>))

  return (
    <List sx={{
      '& li': {
        float: "left",
        margin: "2px",
      }
    }}>
      {pageNav}
    </List>
  )
}

export default Paginate
