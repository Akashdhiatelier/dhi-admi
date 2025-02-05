import React from "react";
import { Card, Pagination } from "react-bootstrap";
import { IconChevronLeft, IconChevronRight} from "@tabler/icons-react";
const TablePagination = ({
    isLoading,
    totalRecords,
    page,
    pageOptions,
    pageSize,
    pageIndex,
    previousPage,
    canPreviousPage,
    nextPage,
    canNextPage,
    gotoPage
}) => {
    const arrayPageIndex = (pageIndex - 2) < 0
                            ? pageOptions.slice(0, pageIndex + 3)
                            : pageOptions.slice((pageIndex - 2), (pageIndex + 3));
    // if(isLoading){
    //     return "";
    // }
	
    return(
	<Card.Footer className={`d-flex align-items-center ${(totalRecords===0) && 'bg-white'}`}>
		{totalRecords > 0 ? (
			<>
				<p className="m-0">
					{" "}
					Showing {((pageSize * pageIndex + 1)<=totalRecords)?(pageSize * pageIndex + 1):totalRecords} to{" "}
					{((pageSize * pageIndex + page.length)<=totalRecords)?(pageSize * pageIndex + page.length):totalRecords} of {totalRecords} entries
				</p>
				<Pagination className="m-0 ms-auto">
					<Pagination.Prev
						onClick={previousPage}
						disabled={!canPreviousPage}
					>
						<span className="d-flex justify-content-center"><IconChevronLeft size={20} stroke={1.5} /> Prev{" "}</span>
					</Pagination.Prev>
                    {/* <Pagination.Ellipsis /> */}
					{arrayPageIndex.map((i) => (
						<Pagination.Item
							key={i}
							onClick={() => gotoPage(i)}
							active={pageIndex === i}
						>
							{i + 1}
						</Pagination.Item>
					))}
                    {/* <Pagination.Ellipsis /> */}
					<Pagination.Next onClick={nextPage} disabled={!canNextPage}>
                        <span className="d-flex justify-content-center">
                            {" "}
                            Next <IconChevronRight size={20} stroke={1.5} />
                        </span>
					</Pagination.Next>
				</Pagination>
			</>
		) : (
			(!isLoading) && (<p className="w-100 text-center mt-3">No result found.</p>)
		)}
	</Card.Footer>
    );
};
export default TablePagination;
